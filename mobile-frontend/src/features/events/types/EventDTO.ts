export interface EventDTO {
    data: {
    article_body: string,
    attendance_mode: string,
    created_at: string,
    date_published: string,
    description: string,
    end_date: string,
    event_status: string,
    id: string,
    image_url: string,
    keywords: [
      string
    ],
    location: {
      address: {
        city: string,
        country: string,
        name: string,
        postal_code: string,
        raw_address_string: string,
        street: string,
        type: string
      },
      name: string,
      type: string
    },
    name: string,
    offer: {
      availability_type: string,
      currency: string,
      is_available: boolean,
      price: number,
      status_text: string,
      type: string,
      url: string
    },
    organizer: {
      address: {
        city: string,
        country: string,
        name: string,
        postal_code: string,
        raw_address_string: string,
        street: string,
        type: string
      },
      name: string,
      type: string,
      url: string
    },
    performer: {
      address: {
        city: string,
        country: string,
        name: string,
        postal_code: string,
        raw_address_string: string,
        street: string,
        type: string
      },
      name: string,
      type: string,
      url: string
    },
    provider: string,
    start_date: string,
    type: string,
    url: string
  },
  error: string | null;
}