export type School = { id: string; name: string };

export type Department = { id: string; name: string };

export type Year = { id: string; name: string };

export type Syllabus = string[][];

export type Grade = {
    grade: string;
    semester: string;
    quoter: string;
    id: string;
};

export type Subject = {
    name: string;
    id: string;
    actualYear: string;
    grades: string[];
};
