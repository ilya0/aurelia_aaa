
export class User {

    // email: string;
    // name: string;
    // token: string;
    // permissions: number[];
    department: Department;

    constructor(public email: string, public name: string, public token: string, public permissions: number[], public departmentId: number, public departmentName: string) { }

}

export class Department {

}