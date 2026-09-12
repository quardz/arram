import type { Access } from "payload";
import { getOrgContext } from "./orgContext";

export const anyone: Access = () => true;

export const isSignedIn: Access = ({ req }) => Boolean(req.user);

export const isAdmin: Access = async ({ req }) => (await getOrgContext(req)).isAdmin;

/** Signed in AND holding at least one active org assignment. */
export const isOrgUser: Access = async ({ req }) => {
  const ctx = await getOrgContext(req);
  return ctx.isSignedIn && ctx.assignments.length > 0;
};

export { getOrgContext };
