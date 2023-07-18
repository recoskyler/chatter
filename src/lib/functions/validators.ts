import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_EMAIL_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "$lib/constants.js";
import isEmail from "validator/lib/isEmail";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

export const isNameValid = (name: string) =>
  name.trim().length >= MIN_NAME_LENGTH && name.trim().length <= MAX_NAME_LENGTH;

export const isEmailValid = (email: string) =>
  email.trim().length >= MIN_EMAIL_LENGTH &&
  email.trim().length <= MAX_EMAIL_LENGTH &&
  isEmail(email);

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

zxcvbnOptions.setOptions(options);

export const isPasswordValid = (password: string) =>
  password.length >= MIN_PASSWORD_LENGTH &&
  password.length <= MAX_PASSWORD_LENGTH &&
  zxcvbn(password).score >= 3;

export const isValid = (name: string, email: string, password: string) => (
  isNameValid(name) &&
  isPasswordValid(password) &&
  isEmailValid(email)
);
