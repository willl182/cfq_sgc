import {
  DataModelFromSchema,
  DocumentByName,
  TableNames,
  SystemTableNames,
} from "convex/server";
import schema from "../schema";

export type DataModel = DataModelFromSchema<typeof schema>;
export type TableName = TableNames<DataModel>;
export type SystemTableName = SystemTableNames<DataModel>;

export type Doc<Name extends TableName | SystemTableName> = DocumentByName<
  DataModel,
  Name
>;
export type Id<Name extends TableName | SystemTableName> = string & {
  __tableName: Name;
};
