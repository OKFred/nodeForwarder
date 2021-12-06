const { app, BrowserWindow } = require('electron');
const path = require('path')
// 修改现有的 createWindow() 函数
function createWindow () {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile('index.html')
    // 打开开发工具
    mainWindow.webContents.openDevTools()
}
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});