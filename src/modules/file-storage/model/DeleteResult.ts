export class DeleteResult {
  DeleteMarker: boolean;
  VersionId?: string;
  RequestCharged?: string;

  static fromAws(data: any) {
    const result = new DeleteResult();

    if (data.DeleteMarker && typeof data.DeleteMarker === 'boolean') {
      result.DeleteMarker = data.Key;
    }

    if (data.VersionId && typeof data.VersionId === 'string') {
      result.VersionId = data.VersionId;
    }

    if (data.RequestCharged && typeof data.RequestCharged === 'string') {
      result.RequestCharged = data.RequestCharged;
    }

    return result;
  }
}
