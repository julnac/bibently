namespace Bibently.Application.Api.Mappings;

using Bibently.Application.Abstractions.Models;
using Bibently.Application.Repository.Models;
using Riok.Mapperly.Abstractions;

[Mapper]
public partial class AppMapper
{
    public partial Address Map(AddressDocument source);
    public partial AddressDocument Map(Address source);

    public partial Location Map(LocationDocument source);
    public partial LocationDocument Map(Location source);

    public partial Organization Map(OrganizationDocument source);
    public partial OrganizationDocument Map(Organization source);

    public partial Offer Map(OfferDocument source);
    public partial OfferDocument Map(Offer source);

    public partial EventEntity Map(EventDocument source);
    public partial EventDocument Map(EventEntity source);

    public partial TrackingEvent Map(TrackingEventDocument source);
    public partial TrackingEventDocument Map(TrackingEvent source);

    public partial List<EventEntity> Map(List<EventDocument> source);
    public partial List<EventDocument> Map(List<EventEntity> source);

    public partial IEnumerable<EventDocument> Map(IEnumerable<EventEntity> source);

    public partial UserEntity Map(UserDocument source);
    public partial UserDocument Map(UserEntity source);

    [MapperIgnoreTarget(nameof(EventDocument.Id))]
    [MapperIgnoreTarget(nameof(EventDocument.CreatedAt))]
    [MapperIgnoreTarget(nameof(EventDocument.AttendeeCount))]
    [MapperIgnoreTarget(nameof(EventDocument.CreatedBy))]
    public partial EventDocument Map(CreateEventEntityRequest source);
}
