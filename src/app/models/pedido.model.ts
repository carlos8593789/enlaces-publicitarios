import { Cliente } from "./cliente.model";

export interface Pedido {
  id: number;
  cliente: Cliente
}