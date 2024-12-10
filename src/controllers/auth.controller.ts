import env from "@/env";
import { cloudinary } from "@/services/cloudinary";
import { supabase, supabasePro } from "@/services/supabase";
import { Request, RequestHandler, Response } from "express";

/**
 * Sign up with email
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/auth/signup
 */
const signUpWithEmail: RequestHandler = async (req: Request, res: Response) => {
  const { email, password, avatarurl, country, username } = req.body;

  try {
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const metadata = {
      ...(avatarurl && { avatarurl }),
      ...(country && { country }),
      ...(username && { username }),
    };

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      ...(metadata && { options: { data: metadata } }),
    });

    if (error) {
      res.status(error.status ?? 500).json({ error: error.message });
      return;
    }

    if (req.file) {
      cloudinary.upload(req.file, "users", data.user!.id);
    }

    const { data: roleData, error: roleError } = await supabasePro
      .from("profiles")
      .select("username, role")
      .eq("id", data.user!.id)
      .single();

    if (!roleData || roleError) {
      res.status(502).json({
        error:
          "User created successfully but failed to fetch metadata, please direct users to sign in endpoint",
      });
      return;
    }

    let email_verified = true;
    if (!data.user?.email_confirmed_at) {
      email_verified = false;
    }

    res.status(200).json({
      user: {
        id: data.user?.id,
        aud: data.user?.aud,
        username: roleData.username,
        role: roleData.role,
        email_verified,
      },
      session: {
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token,
      },
    });
    return;
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later" });
    return;
  }
};

/**
 * Sign in with email
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/auth/signin
 */
const signInWithEmail: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    let data, error;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    ({ data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    }));

    if (error) {
      res.status(error.status ?? 500).json({ error: error.message });
      return;
    }

    const { data: roleData, error: roleError } = await supabasePro
      .from("profiles")
      .select("username, role")
      .eq("id", data.user!.id)
      .single();

    if (!roleData || roleError) {
      res.setHeader("Retry-After", "3");
      res.status(503).json({
        error:
          "User signed in successfully but failed to fetch metadata, please try again",
      });
      return;
    }

    let email_verified = true;
    if (!data.user?.email_confirmed_at) {
      email_verified = false;
    }

    res.status(200).json({
      user: {
        id: data.user?.id,
        aud: data.user?.aud,
        username: roleData.username,
        role: roleData.role,
        email_verified,
      },
      session: {
        access_token: data.session?.access_token,
        expires_in: data.session?.expires_in,
        refresh_token: data.session?.refresh_token,
      },
    });
    return;
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later" });
    return;
  }
};

/**
 * Sign in with Google
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/auth/oauth
 */
const signInWithGoogle: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.BASE_URL.replace(/\*/g, "open")}/v1/auth/oauth/callback`,
    },
  });

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  if (!data.url) {
    res.status(500).json({ error: "Failed to fetch oauth url" });
    return;
  }

  res.status(200).json({ url: data.url });
};

/**
 * Handle OAuth callback
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/auth/oauth/callback
 */
const handleOAuthCallback: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const baseUrl = env.BASE_URL.replace(/\*/g, "open");
  const callbackAddr = new URL("/api/auth/callback", baseUrl).toString();
  const redirectAddr = new URL("/login", baseUrl).toString();

  const { code } = req.query;

  if (!code) {
    const codeErrorParams = new URLSearchParams({
      error: "code missing",
    });
    return res.status(400).redirect(`${redirectAddr}?${codeErrorParams}`);
  }

  const { data: tokenData, error: tokenError } =
    await supabase.auth.exchangeCodeForSession(code as string);

  if (tokenError) {
    const tokenErrorParams = new URLSearchParams({
      error: "token exchange failed",
    });
    return res.status(500).redirect(`${redirectAddr}?${tokenErrorParams}`);
  }

  const { access_token, refresh_token, expires_in, user } = tokenData.session;

  const {
    data: userData,
    error: userError,
    status,
  } = await supabasePro
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single();

  if (userError) {
    const userErrorParams = new URLSearchParams({
      error: "user fetch failed",
    });
    return res
      .status(status ?? 500)
      .redirect(`${redirectAddr}?${userErrorParams}`);
  }

  try {
    await fetch(callbackAddr, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          id: user.id,
          aud: user.aud,
          username: userData.username,
          role: userData.role,
        },
        session: {
          access_token,
          expires_in,
          refresh_token,
        },
      }),
    });

    return res.redirect(redirectAddr);
  } catch (error) {
    console.error(error);
    const unknownErrorParams = new URLSearchParams({
      error: "unhandled fetch exception",
    });
    return res.status(500).redirect(`${redirectAddr}?${unknownErrorParams}`);
  }
};

/**
 * Update user credentials
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example POST /api/auth/credentials
 */
const updateUserCredentials: RequestHandler = async (
  req: Request,
  res: Response,
) => {
  const { email, password } = req.body;
  let response: object;

  response = {
    ...(email && { email }),
    ...(password && { password }),
  };

  const { error } = await supabase.auth.updateUser(response);

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.status(204).send();
};

/**
 * Sign out
 * @param req Request
 * @param res Response
 * @returns Promise<void>
 * @example GET /api/auth/signout
 */
const signOut: RequestHandler = async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    res.status(error.status ?? 500).json({ error: error.message });
    return;
  }

  res.status(204).send();
};

const AuthController = {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  handleOAuthCallback,
  updateUserCredentials,
  signOut,
};

export { AuthController };
