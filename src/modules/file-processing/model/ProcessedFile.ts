type Params = {
  path: string;
  filename: string;
  extension: string;
};

export class ProcessedFile {
  path: string;
  filename: string;
  extension: string;

  public static create(path: string, filename: string, extension: string) {
    return new ProcessedFile({
      path,
      filename,
      extension,
    });
  }

  private constructor(params: Params) {
    this.path = params.path;
    this.filename = params.filename;
    this.extension = params.extension;
  }

  public fullFilename() {
    return this.extension ? `${this.filename}${this.extension}` : this.filename;
  }
}
