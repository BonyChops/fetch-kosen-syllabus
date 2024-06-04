import { publicSubjects } from './syllabusUrl';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { load } from 'cheerio';
import cheerioTableparser from 'cheerio-tableparser';
import { Syllabus } from './types';

async function fetchDepartmentSyllabus(schoolId: string, departmentId: string, year: string): Promise<Syllabus> {
    const url = new URL(publicSubjects);
    const query = url.searchParams;
    query.set('school_id', schoolId);
    query.set('department_id', departmentId);
    query.set('year', year);
    const htmlRaw = await axios.get(url.toString());
    const dom = new JSDOM(htmlRaw.data);

    const syllabysTableDom =
        dom.window.document.querySelector('table#sytablenc');

    if (!syllabysTableDom) {
        throw new Error('Failed to get syllabys table');
    }

    syllabysTableDom.querySelectorAll('tr').forEach((tr) => {
        tr.querySelectorAll('td[style*="display:none"]').forEach((td) => {
            tr.removeChild(td);
        });
    });

    const cheerioDom = load(syllabysTableDom.outerHTML);
    cheerioTableparser(cheerioDom);

    const syllabysTableTransposed = (cheerioDom('table') as any).parsetable(
        true,
        true,
        false
    ) as string[][];

    return syllabysTableTransposed[0].map((col, i) =>
        syllabysTableTransposed.map((row) => row[i])
    );
}

export { fetchDepartmentSyllabus };
