import { NextApiRequest, NextApiResponse } from "next";
import * as models from "../../../../../utils/models";
import * as api from "../../../../../utils/api";
import * as authorizeActions from "../../../../../utils/authorize_actions";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const payload = api.getTokenPayload(req, res);
  if (payload === null) {
    res.status(400).json("Invalid token");
    return;
  }
  const groupId = api.getGroupId(req);
  const group = await authorizeActions.authorizeGroup(payload.userId, groupId);
  if (!group) {
    res.status(400).send("Group not found");
    return;
  }
  switch (req.method) {
    case "GET":
      res.status(200).json(group);
      break;
    case "PUT":
      const parsedGroup = JSON.parse(req.body) as models.Group;
      const updatedGroup = await models.updateGroup(
        parsedGroup,
        payload.userId
      );
      res.status(200).json(updatedGroup);
      break;
    default:
      api.allowMethods(req, res, ["GET", "PUT"]);
  }
}
