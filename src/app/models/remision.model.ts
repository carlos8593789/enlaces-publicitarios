import { Pedido } from "./pedido.model";
import { Usuario } from "./usuario.model";

export interface Remision {
  id: number;
  numero: string;
  estatus: number;
  estatus_remision: string;
  fecha_alta: string;
  fecha_modificacion: string;
  id_usuario: number;
  id_pedido: number;
  resurtida: boolean;
  total: string;
  usuario_resurtir: string;
  fecha_resurtir: string;
  cancelada: boolean;
  pedido: Pedido;
  usuario: Usuario;
  estatus_resurtida: string;
}
