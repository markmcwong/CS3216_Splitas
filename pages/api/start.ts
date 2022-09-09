import { NextApiRequest, NextApiResponse } from "next";
import * as models from "../../utils/models";
import * as api from "../../utils/api";
import * as oauth from "../../utils/oauth";
import * as url from "../../utils/url";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = api.getSessionCookie(req, res);
  if (session !== undefined) {
    const user = await models.getUserBySession(session);
    if (user !== null) {
      res.redirect(url.homepage);
      return;
    }
  }

  const state = api.generateStateAndSetCookie(req, res);
  const endpoint = await oauth.getAuthEndpointWithParams(state);
  res.redirect(endpoint);
}
