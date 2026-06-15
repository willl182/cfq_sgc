import {
  ActionBuilder,
  MutationBuilder,
  QueryBuilder,
  QueryCtx as GenericQueryCtx,
  MutationCtx as GenericMutationCtx,
  ActionCtx as GenericActionCtx,
} from "convex/server";
import { DataModel } from "./dataModel";

export declare const query: QueryBuilder<DataModel, "public">;
export declare const mutation: MutationBuilder<DataModel, "public">;
export declare const action: ActionBuilder<DataModel, "public">;

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
