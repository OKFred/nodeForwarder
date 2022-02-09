const { app, BrowserWindow, session } = require('electron');
const path = require('path');
var mainWindow;
// 修改现有的 createWindow() 函数
function createWindow () {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('index.html')
};
app.whenReady().then(async() => {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
    //导入Chrome插件
    let extensionPath =path.join(__dirname,`extension/xPanel/0.9.9_0`);
      let ext=await session.defaultSession.loadExtension(extensionPath);
      //console.log(ext);
    // 打开开发工具
    mainWindow.webContents.openDevTools()
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});