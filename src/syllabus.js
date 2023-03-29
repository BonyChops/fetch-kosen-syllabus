const { publicSubjects } = require('./syllabusUrl');
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');

async function fetchDepartmentSyllabus(schoolId, departmentId, year) {
    const url = new URL(publicSubjects);
    const query = url.searchParams;
    query.set('school_id', schoolId);
    query.set('department_id', departmentId);
    query.set('year', year);
    const htmlRaw = await axios.get(url.toString());
    const dom = new JSDOM(htmlRaw.data);

    const syllabysTableDom =
        dom.window.document.querySelector('table#sytablenc');

    syllabysTableDom.querySelectorAll('tr').forEach((tr) => {
        tr.querySelectorAll('td[style*="display:none"]').forEach((td) => {
            tr.removeChild(td);
        });
    });

    const cheerioDom = cheerio.load(syllabysTableDom.outerHTML);
    cheerioTableparser(cheerioDom);

    const syllabysTableTransposed = cheerioDom('table').parsetable(
        true,
        true,
        false
    );
    const syllabysTable = syllabysTableTransposed[0].map((col, i) =>
        syllabysTableTransposed.map((row) => row[i])
    );

    return syllabysTable;
}

module.exports = { fetchDepartmentSyllabus };
