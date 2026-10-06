import app from "./app";
import { env } from "./config/env";

/** Entry point: jalankan Express `app` (lihat app.ts) di PORT dari env. */
app.listen(env.port, () => {
  console.log(`Server berjalan di http://localhost:${env.port}`);
});
