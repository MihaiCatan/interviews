import { connect, dicsonnect, init } from "./database";
import server from "./server";

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});

connect().then(res => {
  init()
}).finally(() => {
  // dicsonnect();
})
