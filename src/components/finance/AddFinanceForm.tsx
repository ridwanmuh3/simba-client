import { Label } from "@/components/ui/label";
import Dropzone from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { Plus, Receipt, Save, UploadCloud } from "lucide-react";
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddFinance } from "@/features/finance/api";
import { toast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { compressImage, formatCurrency, parseCurrency } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import RequiredInputIdentifier from "../shared/RequiredInputIdentifier";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

// const AddFinanceForm = () => {
//   const form = useForm<AddFinanceFormInputs>({
//     resolver: zodResolver(addFinanceSchema),
//     defaultValues: {
//       type: "",
//       category: "",
//       description: "",
//       amount: 0,
//       extraNote: "",
//       proofImage: null,
//     },
//   });
//   const addFinance = useAddFinance();
//   const [errMsg, setErrMsg] = useState("");
//   const handleAddFinance = async (data: AddFinanceFormInputs) => {
//     setErrMsg("");
//     try {
//       const formData = new FormData();

//       formData.append("type", data.type);
//       formData.append("description", data.description);
//       formData.append("amount", data.amount.toString());

//       if (data.type === "PEMASUKAN") {
//         formData.append("category", "Pemasukan");
//       } else {
//         formData.append("category", data.category);
//       }

//       if (data.extraNote) {
//         formData.append("extra_note", data.extraNote);
//       }

//       if (data.proofImage) {
//         formData.append("proof_image", data.proofImage);
//       }
//       await addFinance.mutateAsync(formData);

//       toast({
//         title: "Berhasil",
//         description: `Data keuangan  berhasil ditambahkan`,
//       });

//       form.reset();
//     } catch (e) {
//       const err = e as AxiosError;
//       switch (err.status) {
//         case 400:
//           setErrMsg("Terjadi kesalahan input data bahan");
//           break;
//         case 404:
//           setErrMsg("Data tidak ditemukan");
//         default:
//           setErrMsg("Terjadi kesalahan server");
//           break;
//       }
//     }
//   };

//   return (
//     <Card className="lg:col-span-1 h-fit">
//       <CardHeader className="pb-4">
//         <CardTitle className="text-lg">Input Keuangan</CardTitle>
//         <CardDescription className="text-sm font-bold text-muted-foreground">
//           Input dengan tanda (*) wajib diisi.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form
//           onSubmit={form.handleSubmit(handleAddFinance)}
//           className="space-y-4"
//         >
//           {/* JENIS */}
//           <div className="space-y-2">
//             <Label>
//               Jenis <RequiredInputIdentifier />
//             </Label>
//             <Controller
//               name="type"
//               control={form.control}
//               render={({ field }) => (
//                 <Select value={field.value} onValueChange={field.onChange}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Pilih Jenis" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="PEMASUKAN">PEMASUKAN</SelectItem>
//                     <SelectItem value="PENGELUARAN">PENGELUARAN</SelectItem>
//                   </SelectContent>
//                 </Select>
//               )}
//             />
//           </div>

//           {/* PENGELUARAN */}
//           {form.watch("type") === "PENGELUARAN" && (
//             <>
//               <div className="space-y-2">
//                 <Label>
//                   Kategori <RequiredInputIdentifier />
//                 </Label>
//                 <Controller
//                   name="category"
//                   control={form.control}
//                   render={({ field }) => (
//                     <Select value={field.value} onValueChange={field.onChange}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Pilih kategori" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {transactionCategories.map((cat) => (
//                           <SelectItem key={cat} value={cat}>
//                             {cat}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>
//                   Deskripsi <RequiredInputIdentifier />
//                 </Label>
//                 <Input {...form.register("description")} />
//               </div>
//             </>
//           )}

//           {/* JUMLAH */}
//           <div className="space-y-2">
//             <Label>
//               Jumlah (Rp) <RequiredInputIdentifier />
//             </Label>
//             <Controller
//               name="amount"
//               control={form.control}
//               render={({ field }) => (
//                 <Input
//                   inputMode="numeric"
//                   value={formatCurrency(field.value)}
//                   onChange={(e) =>
//                     field.onChange(parseCurrency(e.target.value))
//                   }
//                 />
//               )}
//             />
//           </div>

//           {/* FOTO BUKTI */}
//           <div className="space-y-2">
//             <Label>
//               Foto Bukti <RequiredInputIdentifier />
//             </Label>
//             <Controller
//               name="proofImage"
//               control={form.control}
//               render={({ field: { value, onBlur, onChange } }) => (
//                 <Dropzone
//                   multiple={false}
//                   accept={{
//                     "image/jpeg": [".jpg", ".jpeg"],
//                     "image/png": [".png"],
//                   }}
//                   onDrop={async (files) => {
//                     if (!files || files.length === 0) return;
//                     const compressedFile = await compressImage(files[0]);
//                     onChange(compressedFile);
//                   }}
//                 >
//                   {({ getRootProps, getInputProps, isDragActive }) => (
//                     <div
//                       {...getRootProps()}
//                       className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${isDragActive ? "border-primary bg-primary/10 ring-2 ring-primary/20" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 bg-background"} ${!!value ? "border-primary/50" : ""} `}
//                     >
//                       {" "}
//                       <input {...getInputProps()} onBlur={onBlur} />{" "}
//                       {value ? (
//                         <div className="flex flex-col items-center gap-4 w-full">
//                           {" "}
//                           <div className="relative aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
//                             {" "}
//                             <img
//                               src={
//                                 typeof value === "string"
//                                   ? value
//                                   : URL.createObjectURL(value)
//                               }
//                               alt="Preview"
//                               className="h-full w-full object-cover"
//                             />{" "}
//                           </div>{" "}
//                           <div className="text-center">
//                             {" "}
//                             <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
//                               {" "}
//                               {value.name || "Gambar terpilih"}{" "}
//                             </p>{" "}
//                             <p className="text-xs text-muted-foreground">
//                               {" "}
//                               Klik untuk ganti gambar{" "}
//                             </p>{" "}
//                           </div>{" "}
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center gap-2 text-center">
//                           {" "}
//                           <div className="p-4 rounded-full bg-muted">
//                             {" "}
//                             <UploadCloud className="w-8 h-8 text-muted-foreground" />{" "}
//                           </div>{" "}
//                           <div>
//                             {" "}
//                             <p className="text-sm font-semibold text-foreground">
//                               {" "}
//                               Klik untuk upload{" "}
//                               <span className="font-normal text-muted-foreground">
//                                 {" "}
//                                 atau seret gambar ke sini{" "}
//                               </span>{" "}
//                             </p>{" "}
//                             <p className="text-xs text-muted-foreground mt-1">
//                               {" "}
//                               PNG, JPG atau JPEG (Maks. 5MB){" "}
//                             </p>{" "}
//                           </div>{" "}
//                         </div>
//                       )}{" "}
//                     </div>
//                   )}
//                 </Dropzone>
//               )}
//             />
//           </div>

//           {/* CATATAN */}
//           <div className="space-y-2">
//             <Label>Catatan</Label>
//             <Textarea {...form.register("extraNote")} rows={3} />
//           </div>

//           {/* ACTION */}
//           <div className="pt-2">
//             <Button
//               type="submit"
//               className="w-full"
//               disabled={form.formState.isSubmitting}
//             >
//               <Save className="w-4 h-4 mr-1" />
//               Simpan
//             </Button>
//           </div>

//           {errMsg && (
//             <p className="text-sm text-destructive text-center">{errMsg}</p>
//           )}
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// export default AddFinanceForm;
