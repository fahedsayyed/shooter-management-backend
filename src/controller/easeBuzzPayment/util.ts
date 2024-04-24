// import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

// export const validateEmail = (mail: string): boolean => {
//   return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
// };

// export const validatePhone = (number: string): boolean => {
//   return number.length === 10;
// };

// export const validateFloat = (number: number): boolean => {
//   return parseFloat(number.toString()) === number;
// };

// export const getBaseUrl = (env: string): string => {
//   if (env === "prod") {
//     return "https://pay.easebuzz.in";
//   }
//   return "https://testpay.easebuzz.in";
// };

// export const curl_call = async function (
//   url: string,
//   data: any,
//   method = "POST"
// ): Promise<any> {
//   const config: AxiosRequestConfig = {
//     method: method,
//     url: url,
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     data: data,
//   };

//   return axios(config)
//     .then((response: AxiosResponse) => {
//       try {
//         const responseData = response.data;
//         return Promise.resolve(responseData);
//       } catch (parseError) {
//         return Promise.reject(parseError);
//       }
//     })
//     .catch((error: any) => {
//       return Promise.reject(error);
//     });
// };

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const validateEmail = (mail: string): boolean => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);

export const validatePhone = (number: string): boolean => number.length === 10;

export const validateFloat = (number: number): boolean => parseFloat(number.toString()) === number;

export const getBaseUrl = (env: string): string => env === "prod" ? "https://pay.easebuzz.in" : "https://testpay.easebuzz.in";

export const curl_call = async (url: string, data: any, method: string = "POST"): Promise<any> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data,
  };

  try {
    const response: AxiosResponse = await axios(config);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

