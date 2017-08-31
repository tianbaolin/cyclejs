#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const basePath = path.join(__dirname, '..');

const template = fs.readFileSync(path.join(basePath, 'index.template.ts'), 'utf-8');

const entryPoints = [
  {packageName: 'xstream', streamType: 'Stream', blankName: true },
  {packageName: 'most', streamType: 'Stream'},
  {packageName: 'rxjs', streamType: 'Observable'},
];

const ownPackageJson = JSON.parse(fs.readFileSync(
  path.join(basePath, 'package.json'), 'utf-8')
);

const templateWithoutContent = template.split('\n').slice(2).join('\n') ;

entryPoints.forEach(entryPoint => {
  const targetFolder = path.join(basePath, '..', entryPoint.packageName);

  fs.copySync(path.join(basePath, 'packageTemplate'), targetFolder, {
    overwrite: false,
  });
  fs.ensureDirSync(path.join(targetFolder, 'src'));

  const jsonPath = path.join(targetFolder, 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  packageJson.name = '@cycle/time' + (entryPoint.blankName ? '' : '-' + entryPoint.packageName);
  packageJson.version = ownPackageJson.version;
  packageJson.dependencies = {
    '@cycle/time-common': 'file:../common', //'^' + ownPackageJson.version,
    [entryPoint.packageName]: '*'
  };
  packageJson['browserify-shim'] = {
    [entryPoint.packageName]: 'global:' + entryPoint.packageName
  };
  fs.writeFileSync(jsonPath, JSON.stringify(packageJson, null, 2));

  const contents = ('// Generated from index.template.ts\n' + templateWithoutContent)
    .replace(/\$\$PACKAGE_NAME\$\$/g, entryPoint.packageName)
    .replace(/\$\$STREAM_TYPE\$\$/g, entryPoint.streamType);

  const packagePath = path.join(targetFolder, 'src', 'index.ts');

  fs.writeFileSync(packagePath, contents, 'utf-8');
});
