import {
  PUBLIC_MIN_PASSWORD_LENGTH as ENV_MIN_PASSWORD_LENGTH,
  PUBLIC_MAX_PASSWORD_LENGTH as ENV_MAX_PASSWORD_LENGTH,
  PUBLIC_MIN_NAME_LENGTH as ENV_MIN_NAME_LENGTH,
  PUBLIC_MAX_NAME_LENGTH as ENV_MAX_NAME_LENGTH,
  PUBLIC_MIN_EMAIL_LENGTH as ENV_MIN_EMAIL_LENGTH,
  PUBLIC_MAX_EMAIL_LENGTH as ENV_MAX_EMAIL_LENGTH,
  PUBLIC_EMAIL_VERIFICATION,
} from "$env/static/public";

export const MIN_PASSWORD_LENGTH = Number.parseInt(ENV_MIN_PASSWORD_LENGTH);
export const MAX_PASSWORD_LENGTH = Number.parseInt(ENV_MAX_PASSWORD_LENGTH);
export const MIN_NAME_LENGTH = Number.parseInt(ENV_MIN_NAME_LENGTH);
export const MAX_NAME_LENGTH = Number.parseInt(ENV_MAX_NAME_LENGTH);
export const MIN_EMAIL_LENGTH = Number.parseInt(ENV_MIN_EMAIL_LENGTH);
export const MAX_EMAIL_LENGTH = Number.parseInt(ENV_MAX_EMAIL_LENGTH);

export const EMAIL_VERIFICATION = PUBLIC_EMAIL_VERIFICATION === "true" || PUBLIC_EMAIL_VERIFICATION === "1";
