export default function log(msg: string, data?: any): void {
    const dataJSON = JSON.stringify(data);
    let message = `${getDateString()} ${msg}`;
    if (dataJSON) {
        message += ` - ${dataJSON}`;
    }
    console.log(message);
}

function getDateString(): String {
    const date = new Date();

    const hours = ('0' + date.getHours()).slice(-2);
    const min = ('0' + date.getMinutes()).slice(-2);
    const sec = ('0' + date.getSeconds()).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `[${day}.${month}.${year} ${hours}:${min}:${sec}]`;
}
