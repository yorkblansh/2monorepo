// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";
// import shell from "shelljs";
// import path from "path";
// import fs from "fs";

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {
//   // Use the console to output diagnostic information (console.log) and errors (console.error)
//   // This line of code will only be executed once when your extension is activated
//   console.log('Congratulations, your extension "2monorepo" is now active!');

//   // The command has been defined in the package.json file
//   // Now provide the implementation of the command with registerCommand
//   // The commandId parameter must match the command field in package.json
//   // const folderPath=''

//   const disposable = vscode.commands.registerCommand(
//     "2monorepo.helloWorld",
//     async () => {
//       // The code you place here will be executed every time your command is executed
//       // Display a message box to the user
//       // vscode.window.showInformationMessage("Hello World from 2monorepo!");
//       // const pp=vscode.workspace.getWorkspaceFolder(vscode.Uri.parse('.'))

//       // if(pp){
//       //   vscode.window.showInformationMessage(pp.uri.toString());
//       // }else{
//       //   vscode.window.showInformationMessage("123");
//       // }

//       // const workspaceFolderName = vscode.workspace.workspaceFolders;
//       // if (workspaceFolderName) {
//       //   const projectRootFiles = await vscode.workspace.findFiles("*");

//       //   if (projectRootFiles.length > 0) {
//       //     projectRootFiles.map(async (e) => {
//       //       const fsPath = e.fsPath;
//       //       // console.log({ EL: e.fsPath });

//       //       if (fsPath.endsWith("package.json")) {
//       //         // console.log({P:fsPath})

//       //         const fileUri = vscode.Uri.file(fsPath);

//       //         const editor = await vscode.window.showTextDocument(fileUri);

//       //         const packageJson = JSON.parse(editor.document.getText());

//       //         console.log({ DOC: packageJson });
//       //       }
//       //       // console.log({ EL: e.path.split(workspaceFolderName[0].name)[1] });
//       //     });
//       //   }
//       // }

//       // console.log({ PATHH: await vscode.workspace.workspaceFolders });
//       // console.log({ WF: await vscode.workspace.findFiles("*") });

//       // Ask the user for the repository URL
//       const repoUrl = await vscode.window.showInputBox({
//         prompt: "Enter the Git repository URL to clone",
//         placeHolder: "https://github.com/your-repo.git",
//       });

//       // If no URL was entered, return early
//       if (!repoUrl) {
//         vscode.window.showErrorMessage("No repository URL was provided.");
//         return;
//       }

//       // Get the path of the current workspace
//       const workspaceFolders = vscode.workspace.workspaceFolders;
//       if (!workspaceFolders) {
//         vscode.window.showErrorMessage("No workspace is open");
//         return;
//       }
//       const workspacePath = workspaceFolders[0].uri.fsPath;

//       // Check if Git is installed
//       if (!shell.which("git")) {
//         vscode.window.showErrorMessage(
//           "Git is not installed or not found in PATH"
//         );
//         return;
//       }

//       // Create a temporary directory for cloning
//       const tempDir = path.join(workspacePath, ".temp-clone");
//       if (!fs.existsSync(tempDir)) {
//         fs.mkdirSync(tempDir);
//       }

//       const cloneCommand = `git clone ${repoUrl} ${tempDir}`;

//       try {
//         shell.exec(
//           cloneCommand,
//           { silent: true },
//           function (code, stdout, stderr) {
//             if (code === 0) {
//               // Move all cloned files from the temp directory to the workspace directory
//               shell.mv("-n", path.join("temp_dir", "*"), workspacePath);

//               // Remove the temporary directory
//               shell.rm("-rf", "temp_dir");

//               vscode.window.showInformationMessage(
//                 `Git Clone Successful: Repository cloned to the workspace`
//               );
//               // Refresh the VSCode workspace
//               vscode.commands.executeCommand(
//                 "workbench.files.action.refreshFilesExplorer"
//               );
//             } else {
//               vscode.window.showErrorMessage(
//                 `Failed to execute Git clone: ${stderr}`
//               );
//               // Clean up temp directory if the clone failed
//               shell.rm("-rf", "temp_dir");
//             }
//           }
//         );
//       } catch (error) {
//         console.log(error);
//       }
//     }
//   );

//   context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}

// Import necessary modules
import vscode from "vscode";
// import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";
import { moveFiles } from "./helpers/moveFiles";

const getProjectPath = () => {
  const workspaceFolders = vscode.workspace.workspaceFolders![0].uri.fsPath;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("Рабочая директория не открыта");
    // return;
  }

  return workspaceFolders;
};

const createTemplatePath = () => {
  fs.mkdir(getTemplatePath());
};

const getTemplatePath = () => {
  return getProjectPath() + "\\temp_template_folder";
};

const moveCurrentProjectToTempProjectFolder = async () => {
  const createTempProjectFolder = async () => {
    await fs.mkdir(path.join(getProjectPath(), "temp_project_folder"));
  };

  createTempProjectFolder();
  const files = await fs.readdir(getProjectPath());

  await moveFiles(
    getProjectPath(),
    path.join(getProjectPath(), "temp_project_folder")
  );
};

/**
 * This method is called when your extension is activated.
 * Your extension is activated the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
  // Register the command
  let disposable = vscode.commands.registerCommand(
    "2monorepo.helloWorld",
    async function () {
      // Create a new status bar item that we can manage
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

    // Set initial properties
    statusBarItem.text = 'Git Repo Status';
    statusBarItem.tooltip = 'Click to check repository status';
    statusBarItem.command = 'extension.checkRepoStatus'; // Command to execute on click

    // Show the status bar item
    statusBarItem.show();

    // Register the command to execute when the status bar item is clicked
    let disposable = vscode.commands.registerCommand('extension.checkRepoStatus', async () => {
        // Here you can define what happens when the user clicks the status bar item
        const gitUrl = await vscode.window.showInputBox({ prompt: 'Введите URL Git репозитория' });

        if (gitUrl) {
            vscode.window.showInformationMessage(`Checking status for: ${gitUrl}`);
            // Update status bar item text
            statusBarItem.text = 'Fetching...';
            // Simulate an asynchronous operation like fetching repo status
            setTimeout(() => {
                // Update status bar text again after operation
                statusBarItem.text = 'Git Repo Status: Updated!';
            }, 2000);
        }
    });

    context.subscriptions.push(statusBarItem);

      // moveCurrentProjectToTempProjectFolder();

      // createTemplatePath();

      // const gitUrl = await vscode.window.showInputBox({
      //   prompt: "Введите URL Git репозитория",
      // });

      // if (!gitUrl) {
      //   vscode.window.showErrorMessage("URL не может быть пустым");
      //   return;
      // }

      // console.log(getTemplatePath());

      // try {
      //   const git = simpleGit(getTemplatePath());

      //   // Клонирование репозитория
      //   await git.clone(gitUrl, getTemplatePath());

      //   // Переключение на клонированный репозиторий
      //   process.chdir(getTemplatePath());

      //   // Удаление старого удаленного репозитория с именем origin
      //   // await git.removeRemote("origin");

      //   // Добавление нового удаленного репозитория с именем origin1
      //   await git.addRemote("origin1", gitUrl);

      //   vscode.window.showInformationMessage(
      //     "Репозиторий успешно клонирован с удаленным именем origin1!"
      //   );
      // } catch (error) {
      //   vscode.window.showErrorMessage(
      //     "Ошибка клонирования репозитория: " + error.message
      //   );
      // }
    }
  );

  // Add to the context's subscriptions
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Export the activate and deactivate functions
// module.exports = {
//   activate,
//   deactivate,
// };
