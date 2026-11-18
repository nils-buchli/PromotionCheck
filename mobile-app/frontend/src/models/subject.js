export class Subject {
    constructor({id, name, weight, yearId, hasSubSubject=false}) {
        this.id = id
        this.name = name
        this.weight = weight
        this.yearId = yearId, 
        this.hasSubSubject = hasSubSubject
    }
}