import { getPayload } from "payload";
import config from "@payload-config";

/** Cached Payload local-API client for server-side use (routes, RSC). */
export const getPayloadClient = async () => getPayload({ config });
