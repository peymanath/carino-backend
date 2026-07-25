import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
// import * as sd from "./apis.json";

@Injectable()
export class ApiCallerBomberService {
  // private readonly logger = new Logger(ApiCallerBomberService.name);
  // private cachedApis: string[] | null = null;

  // replacePhoneDeep(obj: any, bomberNumber: string): any {
  //   if (typeof obj === "string") {
  //     return obj.includes("{phone}") ? obj.replace("{phone}", bomberNumber.startsWith("0") ? bomberNumber.slice(1) : bomberNumber) : obj;
  //   }

  //   if (Array.isArray(obj)) {
  //     return obj.map((item) => this.replacePhoneDeep(item, bomberNumber));
  //   }

  //   if (typeof obj === "object" && obj !== null) {
  //     return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, this.replacePhoneDeep(value, bomberNumber)]));
  //   }

  //   return obj;
  // }
  // async callTwentyApis(bomberNumber: string): Promise<void> {
  //   let countSuccess = 0;
  //   let countFail = 0;

  //   if (Array.isArray(sd)) {
  //     const sdFilter = sd.filter(({ bodyType, isDisable, hasCaptcha }) => !!bodyType && bodyType === "json" && !isDisable && !hasCaptcha);

  //     sdFilter.map(async ({ method, body, bodyType, name, headers, url }, inx) => {
  //       let bodyData = {};

  //       if (bodyType === "json") {
  //         bodyData = this.replacePhoneDeep(body, bomberNumber);
  //       }

  //       try {
  //         const res = await axios({
  //           url: url.replace("{phone}", bomberNumber.startsWith("0") ? bomberNumber.slice(1) : bomberNumber),
  //           method,
  //           data: bodyData,
  //           headers: {
  //             ...headers,
  //             "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  //             Accept: "application/json, text/plain, */*",
  //             "Content-Type": "application/json",
  //             Referer: url,
  //             "Accept-Encoding": "gzip, deflate, br",
  //             Connection: "keep-alive"
  //           },
  //           maxBodyLength: Infinity,
  //           maxContentLength: Infinity
  //         });

  //         if (res.status > 299) {
  //           this.logger.warn(`${name} -> ${res.status}`);
  //         } else {
  //           this.logger.log(`${name} -> Boooooooom`);
  //           countSuccess += 1;
  //         }
  //       } catch (err) {
  //         const isAxiosError = axios.isAxiosError(err);
  //         if (isAxiosError && err.response) {
  //           countFail += 1;
  //           this.logger.error(`❌ Failed: ${name} - ${err.response.status}`, err.message);
  //         }
  //       }
  //     });
  //   }
  // }
}
