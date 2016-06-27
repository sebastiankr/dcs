CREATE TABLE [Category_Pair]
( 
	[sub_category]       nvarchar(200)  NOT NULL ,
	[sort_order]         bigint  NOT NULL ,
	[category]           nvarchar(200)  NOT NULL 
)
go

ALTER TABLE [Category_Pair]
	ADD CONSTRAINT [XPKCategory_Pair] PRIMARY KEY  CLUSTERED ([sub_category] ASC,[category] ASC)
go

CREATE TABLE [Valid_Category]
( 
	[category]           nvarchar(200)  NOT NULL 
)
go

ALTER TABLE [Valid_Category]
	ADD CONSTRAINT [XPKValid_Category] PRIMARY KEY  CLUSTERED ([category] ASC)
go


ALTER TABLE [Category_Pair]
	ADD CONSTRAINT [R_4] FOREIGN KEY ([category]) REFERENCES [Valid_Category]([category])
		ON DELETE NO ACTION
		ON UPDATE NO ACTION
go
