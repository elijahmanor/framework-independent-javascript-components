System.config( {
  transpiler: 'typescript',
  typescriptOptions: {
    emitDecoratorMetadata: true
  },
  map: {
    app: "./src"
  },
  packages: {
    app: {
      main: './main.ts',
      defaultExtension: 'ts'
    }
  }
});
