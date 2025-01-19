
import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const RoleSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    enum: ["superadmin", "admin", "usuario"], 
    required: true 
  },
  estado: { 
    type: Boolean, 
    required: true, 
    default: true 
  },
});

const UserSchema = new mongoose.Schema(
  {
    nombre: { 
      type: String, 
      required: [true, 'El nombre es requerido'],
      trim: true
    },
    correo: { 
      type: String, 
      required: [true, 'El correo es requerido'], 
      unique: true, 
      lowercase: true, 
      trim: true,
      validate: {
        validator: (v) => /\S+@\S+\.\S+/.test(v),
        message: props => `${props.value} no es un correo válido.`
      }
    },
    contraseña: { 
      type: String, 
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    roles: {
      type: [RoleSchema],
      default: [{ nombre: 'usuario', estado: true }]
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.contraseña;
        return ret;
      }
    }
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("contraseña")) return next();
  this.contraseña = await bcrypt.hash(this.contraseña, 10);
  next();
});

UserSchema.methods.compararContraseña = async function (contraseña) {
  return await bcrypt.compare(contraseña, this.contraseña);
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;

