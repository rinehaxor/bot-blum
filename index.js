const axios = require('axios');
const moment = require('moment');
const readline = require('readline-sync');

// Meminta token dari pengguna saat kode dijalankan
const token = readline.question('Masukkan token Anda: ');

const urlClaim = 'https://game-domain.blum.codes/api/v1/farming/claim';
const urlStart = 'https://game-domain.blum.codes/api/v1/farming/start';

const headers = {
   Accept: 'application/json, text/plain, */*',
   'Accept-Encoding': 'gzip, deflate, br, zstd',
   'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8',
   Authorization: `Bearer ${token}`,
   'Content-Length': '0',
   Origin: 'https://telegram.blum.codes',
   Referer: 'https://telegram.blum.codes/',
   'Sec-Ch-Ua': '"Chromium";v="124", "Microsoft Edge";v="124", "Not-A.Brand";v="99", "Microsoft Edge WebView2";v="124"',
   'Sec-Ch-Ua-Mobile': '?0',
   'Sec-Ch-Ua-Platform': '"Windows"',
   'Sec-Fetch-Dest': 'empty',
   'Sec-Fetch-Mode': 'cors',
   'Sec-Fetch-Site': 'same-site',
   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
};

let nextEndTime = 0;

function claim() {
   console.log(`[ ${moment().format('HH:mm:ss')} ] Sedang melakukan klaim...`);
   axios
      .post(urlClaim, {}, { headers })
      .then((response) => {
         console.log(`[ ${moment().format('HH:mm:ss')} ] Response klaim: `, response.data);
         console.log(`[ ${moment().format('HH:mm:ss')} ] Klaim berhasil. Klaim berikutnya akan dilakukan pada: ${moment(nextEndTime).format('YYYY-MM-DD HH:mm:ss')}`);
         start(); // Mulai farming setelah klaim berhasil
      })
      .catch((error) => {
         console.error(`[ ${moment().format('HH:mm:ss')} ] Error klaim:`, error);
      });
}

function start() {
   console.log(`[ ${moment().format('HH:mm:ss')} ] Sedang memulai farming...`);
   axios
      .post(urlStart, {}, { headers })
      .then((response) => {
         const startTime = moment(response.data.startTime).format('YYYY-MM-DD HH:mm:ss');
         const endTime = moment(response.data.endTime).format('YYYY-MM-DD HH:mm:ss');
         nextEndTime = response.data.endTime;
         console.log(`[ ${moment().format('HH:mm:ss')} ] Response mulai: `, {
            startTime: startTime,
            endTime: endTime,
            earningsRate: response.data.earningsRate,
            balance: response.data.balance,
         });

         const timeToWait = nextEndTime - Date.now();
         console.log(`[ ${moment().format('HH:mm:ss')} ] Farming dimulai. Klaim berikutnya akan dilakukan pada: ${moment(nextEndTime).format('YYYY-MM-DD HH:mm:ss')}`);
         setTimeout(claim, timeToWait); // Jadwalkan klaim berikutnya sesuai endTime
      })
      .catch((error) => {
         console.error(`[ ${moment().format('HH:mm:ss')} ] Error mulai:`, error);
      });
}

function autoClaim() {
   const now = Date.now();
   if (now >= nextEndTime) {
      claim();
   } else {
      const timeToWait = nextEndTime - now;
      console.log(`[ ${moment().format('HH:mm:ss')} ] Klaim telah dilakukan. Klaim berikutnya akan dilakukan pada: ${moment(nextEndTime).format('YYYY-MM-DD HH:mm:ss')}`);
      setTimeout(claim, timeToWait);
   }
}

// Memulai proses farming pertama kali
start();
