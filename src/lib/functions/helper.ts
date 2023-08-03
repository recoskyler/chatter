export const trimToLength = (str: string, length: number) => {
  if (str.trim().length <= length) return str.trim();

  const trimmed = str.trim();

  return trimmed.slice(0, length);
};

export const setCookie = (name: string, value: string, expirationInDays: number) => {
  const d = (new Date);
  d.setTime(d.getTime() + expirationInDays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

export const getCookie = (name: string) => {
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }

    if (c.indexOf(cookieName) == 0) {
      return c.substring(cookieName.length, c.length);
    }
  }

  return "";
};
