import { apiRequest } from "./config";

export const createCheckoutSession = (plan) =>
  apiRequest("POST", "/payments/create-checkout", { plan });

export const getPaymentStatus = () =>
  apiRequest("GET", "/payments/status");

export const cancelSubscription = () =>
  apiRequest("POST", "/payments/cancel");
