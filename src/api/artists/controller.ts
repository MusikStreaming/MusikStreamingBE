import { cloudinary } from "@/services/cloudinary";
import redis from "@/services/redis";
import supabase from "@/services/supabase";
import { sanitize } from "@/utils";
import { Request, RequestHandler, Response } from "express";

const getAllArtists: RequestHandler = async (req: Request, res: Response) => {
  const page: number = sanitize(req.query.page, {
    type: "number",
    defaultValue: 1,
    min: 1,
  });
  const limit: number = sanitize(req.query.limit, {
    type: "number",
    defaultValue: 10,
    min: 10,
    max: 50,
  });

  const cache = await redis.get(`artists?page=${page}&limit=${limit}`);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  console.log("Fetch data from database");
  const { data, error } = await supabase
    .from("artists")
    .select("id, name, avatarurl")
    .range((page - 1) * limit, page * limit - 1);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(`artists?page=${page}&limit=${limit}`, JSON.stringify({ data }), {
    ex: 300,
  });
  res.status(200).json({ data });
};

const getArtistByID: RequestHandler = async (req: Request, res: Response) => {
  const cache = await redis.get(`artists?id=${req.params.id}`);
  if (cache) {
    console.log("Fetch data from cache");
    res.status(200).json(cache);
    return;
  }

  const { data, error } = await supabase
    .from("artists")
    .select()
    .eq("id", req.params.id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  redis.set(`artists?id=${req.params.id}`, JSON.stringify(data), { ex: 300 });
  res.status(200).json({ data });
};

const updateArtist: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name, description, country } = req.body;
  let { avatarurl } = req.body;

  if (req.file) {
    cloudinary.upload(req.file, "artists", id);
    avatarurl = `${process.env.CLOUDINARY_PREFIX}/artists/i-${id}.jpg`;
  }

  const response = {
    name,
    ...(description && { description }),
    ...(avatarurl && { avatarurl }),
    ...(country && { country }),
  };

  const { data, error } = await supabase
    .from("artists")
    .update(response)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ data });
};

const addArtist: RequestHandler = async (req: Request, res: Response) => {
  const { name, description, avatarurl, country } = req.body;

  if (!name) {
    res.status(400).json({ error: "Payload must have field: name" });
    return;
  }

  const response = {
    name,
    ...(description && { description }),
    ...(avatarurl && { avatarurl }),
    ...(country && { country }),
  };

  const { data, error } = await supabase
    .from("artists")
    .insert(response)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (req.file) {
    cloudinary.upload(req.file, "artists", data.id);
  }

  res.status(200).json({ data });
};

const deleteArtist: RequestHandler = async (req: Request, res: Response) => {
  const id = req.params.id;

  const { error } = await supabase.from("artists").delete().eq("id", id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  cloudinary.delete("artists", `i-${id}`);

  res.status(204).send();
};

export default {
  getAllArtists,
  getArtistByID,
  addArtist,
  updateArtist,
  deleteArtist,
};
