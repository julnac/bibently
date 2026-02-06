namespace Bibently.Application.Repository.Models;

using Google.Cloud.Firestore;

[FirestoreData]
public class LocationDocument
{
    [FirestoreProperty("type")]
    public required string Type { get; set; }

    [FirestoreProperty("name")]
    public required string Name { get; set; }

    [FirestoreProperty("address")]
    public required AddressDocument Address { get; set; }
}
