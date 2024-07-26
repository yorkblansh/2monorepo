import fs from "fs/promises";
import path from "path";
import vscode from "vscode";

export async function moveFiles(sourceDir: string, targetDir: string) {
  try {
    const files = await fs.readdir(sourceDir);
    await Promise.all(
      files.map(async (file) => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);

        // Move each file from source to target directory
        if (
          !((await fs.lstat(sourcePath)).isDirectory() && file.startsWith("."))
        ) {
          await fs.rename(sourcePath, targetPath);
        }
      })
    );

    vscode.window.showInformationMessage("Файлы успешно перемещены!");
  } catch (error) {
    vscode.window.showErrorMessage(
      "Ошибка перемещения файлов: " + error.message
    );
  }
}
