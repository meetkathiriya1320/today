import { globSync } from 'glob';
import path from 'path';

// Find all route files in the specified directory
const file_paths = globSync('src/controllers/**/*.js', {
    ignore: ['src/controllers/*.js', 'src/controllers/**/helper/*.js']
});
let obj = {};
for (const k of file_paths) {
    const i = k.replace(path.join('src', 'controllers'), './');
    const controllers = await import(i);
    obj = {
        ...obj,
        ...controllers
    };
}

const controller = obj;
export { controller };
