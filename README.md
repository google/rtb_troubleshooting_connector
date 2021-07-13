# RTB Troubleshooting Connector for Data Studio

**This is not an officially supported Google product.**

This [Data Studio Community Connector] lets [Authorized Buyers] and
[Open Bidders] visualize RTB troubleshooting data in [Data Studio]. It uses the
[RTB Troubleshooting API].

[Data Studio Community Connector]: https://developers.google.com/datastudio/connector
[Authorized Buyers]: https://support.google.com/authorizedbuyers/answer/9070822?hl=en
[Open Bidders]: https://support.google.com/admanager/answer/7128453?hl=en
[Data Studio]: https://datastudio.google.com/overview
[RTB Troubleshooting API]: https://developers.google.com/authorized-buyers/apis/guides/v2/rtb-troubleshooting

## Deployment

To use this connector in Data Studio, you must complete a one-time setup process to deploy your own personal instance of the connector using Google Apps Script. See the [Deployment] page for more information.

[Deployment]: DEPLOYMENT.md

## Usage Notes

Once you have deployed your own instance of the connector, you can refer to general Data Studio
documentation (e.g., the [Quick start guide]) for information about building
dashboards on top of it. Before you get started, though, it is worth taking a few minutes to review
the following notes specific to this connector.

[Quick start guide]: https://support.google.com/datastudio/answer/9171315?hl=en&ref_topic=6267740

### Bidder Data Only

The connector can only display data for bidder accounts and at the bidder level.
Accordingly, it is not possible to view data for child seats or broken out by
child seat, though bidder-level metrics will still reflect activity undertaken
on behalf of child seats.

### Dimension Compatibility

Some dimensions are compatible with all metrics, while others are compatible
only with certain metrics. For example, any metric can be broken down by the
`Environment` dimension, but only the `Available impressions` and `Inventory
matches` metrics can be broken down by the `Filtered by pretargeting` dimension.

This makes sense—it's not possible (for example) for a bid or won impression to
be filtered by pretargeting. Still, it has the potential to cause confusion. If
you notice that your dimension is unexpectedly `null`, this may be the
reason—ensure you are using compatible dimensions and metrics.

To help you do this, the connector groups metrics and dimensions in the **Data**
tab of Data Studio's chart editor. The dimensions under **01. General
dimensions** and **02. Filter-only dimensions** are compatible with all metrics.
Dimensions in other groups are only compatible with metrics in the
correspondingly named group. For example, the dimensions under **03. Available
impression dimensions** are only compatible with the metrics under **04.
Available impression metrics**.

### Filter-Only Dimensions

`Creative ID` and `Deal ID` are "filter-only" dimensions, meaning they are only
available when a subset of values are specified in a [Data Studio filter]. This
directly reflects the structure of the RTB Troubleshooting API, where most
dimensional breakdowns must be inferred by retrieving metrics for combinations
of [filterSets].

For "general" dimensions (e.g., `Environment` and `Platform`), which have a
small number of possible values that change rarely if ever, the connector simply
fetches all the dimension values if the dimension is requested. This is not
practical for filter-only dimensions because there are potentially many values
that may change frequently.

In practice, then, if you want to use the `Creative ID` or `Deal ID` dimensions,
you must create an [Include filter] that specifies one or more IDs for that
field (using the [EQUALS operator] or [IN operator] as appropriate). In
addition, to avoid making huge number of API calls, the connector will throw an
error if fulfilling your request would require more than a moderate number of
filterSets.

[Data Studio filter]: https://support.google.com/datastudio/answer/6291066?hl=en
[filterSets]: https://developers.google.com/authorized-buyers/apis/reference/rest/v2beta1/bidders.accounts.filterSets#resource:-filterset
[Include filter]: https://support.google.com/datastudio/answer/7327641?hl=en&ref_topic=7327560#gbwa:~:text=Include%20vs%20Exclude%20filters
[EQUALS operator]: https://support.google.com/datastudio/answer/7327641?hl=en&ref_topic=7327560#operators:~:text=The%20comparison%20value%20exactly%20matches%20the%20dimension%20value.
[IN operator]: https://support.google.com/datastudio/answer/7327641?hl=en&ref_topic=7327560#operators:~:text=One%20or%20more%20of%20the%20comparison%20values%20exactly%20matches%20the%20dimension%20value.

### Dates

#### Range

Like the RTB Troubleshooting API, the connector can only retrieve data for the
past 30 days. If no date filter is applied in Data Studio, the data displayed
reflects all the data available through the previous day.

#### Recency

Unlike the RTB Troubleshooting API, the connector only fetches data through the
previous day and does not fetch data for the current day.

#### Granularity

Unlike the RTB Troubleshooting API, the connector does not support hourly data.
The finest granularity available is daily.

## Troubleshooting

### API Quota

You may encounter the following error when using the connector: "Unable to
retrieve the requested data because the connector has exhausted its API quota.
Please try again later."

This error means that your Google Cloud Project has exceeded its API quota for
the Ad Exchange Buyer II API. If you see this message frequently, you can follow
the instructions on the [Usage Limits] page to apply for more quota.

[Usage Limits]: https://developers.google.com/authorized-buyers/apis/limits

## Testing

This project uses [gjstest] for testing. Please refer to the gjstest wiki for instructions on [installing] and [running] the framework.

[gjstest]: https://github.com/google/gjstest
[installing]: https://github.com/google/gjstest/wiki/Installing
[running]: https://github.com/google/gjstest/wiki/Getting-started#running-tests
