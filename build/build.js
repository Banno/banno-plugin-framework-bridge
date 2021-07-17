#!/usr/env/node
import gulp from 'gulp';
import closureCompiler from 'google-closure-compiler';
import ChunkGraph from 'closure-calculate-chunks';
import StringReplaceSourceMap from 'string-replace-source-map';
import stream from  'stream';
import path from 'path';
import url from 'url';

class AddExports extends stream.Transform {
  constructor() {
    super({objectMode: true});
  }

  async _transform(file, enc, callback) {
    const originalContents = file.contents.toString('utf8');
    const stringReplaceSourceMap = new StringReplaceSourceMap(originalContents, file.sourceMap);
    const namespacePropExpr = /;\s*ext\.(\w+)\s*=/g;
    const namespaceAssigns = [...originalContents.matchAll(namespacePropExpr)];
    namespaceAssigns.forEach((nsAssignMatch) => {
      stringReplaceSourceMap.replace(nsAssignMatch.index + 1, nsAssignMatch.index + nsAssignMatch[0].length - 1, `const ${nsAssignMatch[1]}`);
    });
    stringReplaceSourceMap.append(`export{${namespaceAssigns.map((nsAssignMatch) => nsAssignMatch[1]).join(',')}};`);

    const newFile = file.clone({contents: false});
    newFile.contents = Buffer.from(stringReplaceSourceMap.toString());
    newFile.sourceMap = await stringReplaceSourceMap.generateSourceMap();
    this.push(newFile);
    callback();
  }
}

const closureCompilerGulp = closureCompiler.gulp();

(async () => {
  const entrypoint = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../src/namespace.js');
  const chunkGraph = await ChunkGraph.buildFromEntrypoints([{
    name: entrypoint,
    files: [entrypoint]
  }]);
  const chunkAndJsFlags = chunkGraph.getClosureCompilerFlags();
  const compilerFlags = {
    warningLevel: 'VERBOSE',
    languageOut: 'ECMASCRIPT_2018',
    moduleResolution: 'NODE',
    assumeFunctionWrapper: true,
    emitUseStrict: false,
    externs: './src/externs.js',
    sourceMapIncludeContent: true,
    jsOutputFile: 'dist/banno-plugin-framework-bridge.js'
  };

  gulp.src(chunkAndJsFlags.js, {base: process.cwd()})
    .pipe(closureCompilerGulp(compilerFlags))
    .pipe(new AddExports())
    .pipe(gulp.dest('.', { sourcemaps: '.' }))
})();
