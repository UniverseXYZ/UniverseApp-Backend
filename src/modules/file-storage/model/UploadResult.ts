export class UploadResult {
  key: string;

  static fromAws(data: any) {
    const result = new UploadResult();

    if (data.Key && typeof data.Key === 'string') {
      result.key = data.Key;
    }

    return result;
  }
}
