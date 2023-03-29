const BottomBar = require('inquirer/lib/ui/bottom-bar');

const loader = ['\\', '|', '/', '-'];
let i = 4;
const ui = new BottomBar({ bottomBar: loader[i % 4] });

async function loadFunc(func, message = 'Loading...') {
    const intervalId = setInterval(() => {
        ui.updateBottomBar(`${loader[i++ % 4]} ${message}`);
    }, 100);
    const result = await func();

    clearInterval(intervalId);
    ui.updateBottomBar('');
    return result;
}

module.exports = { loadFunc };
