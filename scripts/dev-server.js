process.env.NODE_ENV = 'development';

const Vite = require('vite');
const ChildProcess = require('child_process');
const Path = require('path');
const Chalk = require('chalk');
const Chokidar = require('chokidar');
const Electron = require('electron');
const { exit } = require('process');

let electronProcess = null;
let rendererPort = 0;

async function startRenderer() {
    const config = require(Path.join('..', 'config', 'vite.js'));

    const server = await Vite.createServer({
        ...config,
        mode: 'development',
    });

    return server.listen();
}

function startElectron() {
    if (electronProcess) { // single instance lock
        return;
    }

    const args = [
        Path.join(__dirname, '..', 'electron', 'main.js'),
        rendererPort,
    ];

    electronProcess = ChildProcess.spawn(Electron, args);

    electronProcess.stdout.on('data', data => {
        console.log(Chalk.blueBright(`[Electron] `) + Chalk.white(data.toString()));
    });

    electronProcess.stderr.on('data', data => {
        console.log(Chalk.redBright(`[Electron] `) + Chalk.white(data.toString()));
    })
}

function restartElectron() {
    if (electronProcess) {
        electronProcess.kill();
        electronProcess = null;
    }

    startElectron();
}

async function start() {
    console.log(`${Chalk.blueBright('===============================')}`);
    console.log(`${Chalk.blueBright('Starting Electron + Vite Dev Server...')}`);
    console.log(`${Chalk.blueBright('===============================')}`);

    const devServer = await startRenderer();
    rendererPort = devServer.config.server.port;

    startElectron();

    Chokidar.watch(Path.join(__dirname, '..')).on('change', () => {
        restartElectron();
    })
}

start();
