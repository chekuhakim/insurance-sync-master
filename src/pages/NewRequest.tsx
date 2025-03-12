
import { motion } from "framer-motion";
import NavBar from "@/components/navigation/NavBar";
import RequestForm from "@/components/requests/RequestForm";
import { Card, CardContent } from "@/components/ui/card";

const NewRequest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <NavBar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 max-w-3xl mx-auto"
        >
          <section className="text-center space-y-4 mb-8">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              New Insurance Request
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Submit a request for new insurance or policy renewal
            </motion.p>
          </section>
          
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0">
                <RequestForm />
              </CardContent>
            </Card>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
};

export default NewRequest;
