namespace Bibently.Application.Repository.Models;

using Google.Cloud.Firestore;

[FirestoreData]
public class AddressDocument
{
    [FirestoreProperty("type")]
    public required string Type { get; set; }

    [FirestoreProperty("name")]
    public required string Name { get; set; }

    [FirestoreProperty("street")]
    public string? Street { get; set; }

    [FirestoreProperty("city")]
    public required string City { get; set; }

    [FirestoreProperty("country")]
    public required string Country { get; set; }

    [FirestoreProperty("postalCode")]
    public string? PostalCode { get; set; }

    [FirestoreProperty("rawAddressString")]
    public string? RawAddressString { get; set; }

    [FirestoreProperty("latitude")]
    public double? Latitude { get; set; }

    [FirestoreProperty("longitude")]
    public double? Longitude { get; set; }
}
