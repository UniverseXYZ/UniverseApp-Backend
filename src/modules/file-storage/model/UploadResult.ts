export class UploadResult {
  key: string;
  url: string;

  static fromAws(data: any) {
    const result = new UploadResult();

    if (data.Key && typeof data.Key === 'string') {
      result.key = data.Key;
    }

    if (data.Location && typeof data.Location === 'string') {
      result.url = data.Location;
    }

    return result;
  }
}
