export default class User implements UserData {
    public id: number;
    public username: string;
    public password?: string;

    constructor(data: UserData) {
        this.id = data.id;
        this.username = data.username;
        if (data.password) {
            this.password = data.password
        }
    }

    public get printData(): PrintUserData {
        return { id: this.id, username: this.username };
    }
}

export interface UserData {
    id: number;
    username: string;
    password?: string;
}

export interface PrintUserData {
    id: number;
    username: string;
}
