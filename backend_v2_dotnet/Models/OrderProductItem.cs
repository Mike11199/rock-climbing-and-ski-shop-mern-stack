﻿namespace backend_v2.Models;

/// <summary>
/// Intersection table between orders and products.
/// </summary>
public partial class OrderProductItem
{
    public Guid? OrderId { get; set; }

    public Guid? ProductId { get; set; }

    public int? Quantity { get; set; }

    public decimal? Price { get; set; }

    public Guid OrderProductItemId { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Product? Product { get; set; }
}
