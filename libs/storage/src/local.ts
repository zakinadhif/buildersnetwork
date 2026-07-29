import { Disk } from "flydrive";
import { FSDriver } from "flydrive/drivers/fs";
import { createFlyDriveStorage } from "./flydrive";
import type { StorageProvider } from "./provider";

export function createLocalStorage(location: URL | string): StorageProvider {
  return createFlyDriveStorage(
    new Disk(
      new FSDriver({
        location,
        visibility: "private",
      }),
    ),
  );
}
