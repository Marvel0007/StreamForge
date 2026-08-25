import {
  putObject,
  getObject,
  deleteObject,
  objectExists,
} from "./storage.service.js";

const key = "tests/storage-test.txt";
const content = Buffer.from("StreamForge storage test");

async function main() {
  console.log("1. Writing object...");

  const stored = await putObject(
    key,
    content,
    "text/plain",
  );

  console.log("Stored:", stored);

  console.log("2. Checking existence...");

  const exists = await objectExists(key);

  console.log("Exists:", exists);

  console.log("3. Reading object...");

  const result = await getObject(key);

  console.log("Content:", result.toString());

  console.log("4. Deleting object...");

  await deleteObject(key);

  console.log("5. Checking after deletion...");

  const existsAfterDelete = await objectExists(key);

  console.log(
    "Exists after delete:",
    existsAfterDelete,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});