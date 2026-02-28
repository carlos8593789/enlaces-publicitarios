export interface RemisionSurtirInventario {
  id: number;
  color: string;
  imagen: string;
}

export interface RemisionSurtirDetalle {
  id: number;
  id_inventario: number;
  cantidad: number;
  inventario: RemisionSurtirInventario;
}

export interface RemisionSurtirItem {
  id: number;
  id_pedido: number;
  detalles: RemisionSurtirDetalle[];
  estatus_remision: string;
  estatus_resurtida: string;
  estatus: number;
}

export interface ProductosRemisionSurtirResponse {
  data: RemisionSurtirItem[];
}
